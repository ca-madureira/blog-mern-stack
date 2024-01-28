import { useContext, useRef } from "react";
import axios from "axios";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "../App";

import { storeInSession } from "../common/session";
import { authWithGoogle } from "../common/firebase";
import AnimationWrapper from "../common/page-animation";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    console.log(formData);
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        console.log(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };
  const authForm = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z]).{6,20}$/;

    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Nome deve conter ao menos 3 caracteres");
      }
    }

    if (!email.length) {
      return toast.error("Insira email válido");
    }
    if (!emailRegex.test(email)) {
      return toast.error("email invalido");
    }
    if (!passwordRegex.test(password)) {
      return toast.error("senha deve conter de 6 a 20 caracteres");
    }

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        let serverRoute = "/google-auth";
        let formData = {
          access_token: user.accessToken,
        };
        userAuthThroughServer(serverRoute, formData);
      })
      .catch((err) => {
        toast.error("erro ao fazer login");
        return console.log(err);
      });
  };

  return access_token ? (
    <Navigate to='/' />
  ) : (
    <AnimationWrapper keyValue={type}>
      {" "}
      <section className='h-cover flex items-center justify-center'>
        <Toaster />
        <form id='formElement' className='w-[80%] max-w-[400px]'>
          <h1 className='text-4xl font-gelasio  text-center mb-24'>
            {type == "sign-in" ? "Bem-vindo(a)" : "Cadastro"}
          </h1>
          {type != "sign-in" ? (
            <InputBox
              name='fullname'
              type='text'
              placeholder='Nome Completo'
              icon='fi-rr-user'
            />
          ) : (
            ""
          )}
          <InputBox
            name='email'
            type='email'
            placeholder='E-mail'
            icon='fi-rr-envelope'
          />
          <InputBox
            name='password'
            type='password'
            placeholder='Senha'
            icon='fi-rr-key'
          />

          <button
            className='btn-dark center mt-14'
            type='submit'
            onClick={handleSubmit}
          >
            {type == "sign-in" ? "Entrar" : "Cadastrar"}
          </button>
          <div className='relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold'>
            <hr className='w-1/2 border-black' />
            <p>ou</p>
            <hr className='w-1/2 border-black' />
          </div>
          <button
            className='btn-dark flex items-center justify-center gap-4 w-[90%] center'
            onClick={handleGoogleAuth}
          >
            <img className='h-8 w-8' src={googleIcon} />
            Continue com Google
          </button>
          {type == "sign-in" ? (
            <p className='mt-6 text-dark-grey text-xl text-center'>
              Não tem conta?
              <Link to='/signup' className='underline text-black text-xl ml-1'>
                Cadastre-se
              </Link>
            </p>
          ) : (
            <p className='mt-6 text-dark-grey text-xl text-center'>
              Já tem conta?
              <Link to='/signup' className='underline text-black text-xl ml-1'>
                Entrar
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
