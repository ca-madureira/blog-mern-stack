import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "../App";
import { storeInSession } from "../common/session";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?w+)*(\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z]).{6,20}$/;
    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    if (fullname) {
      if (fullname.length < 3) {
        return toast.error({
          error: "fullname muste be at least 3 letters long",
        });
      }
    }

    if (!email.length) {
      return toast.error({ error: "enter email" });
    }
    if (!emailRegex.test(email)) {
      return toast.error({ error: "email is invalid" });
    }
    if (!passwordRegex.test(password)) {
      return toast.error({ error: "Password should be 6 to 20 characteres" });
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
        toast.error("trouble login through google");
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
          <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>
            {type == "sign-in" ? "welcome back" : "join us today"}
          </h1>
          {type != "sign-in" ? (
            <InputBox
              name='fullname'
              type='text'
              placeholder='full name'
              icon='fi-rr-user'
            />
          ) : (
            ""
          )}
          <InputBox
            name='email'
            type='email'
            placeholder='email'
            icon='fi-rr-envelope'
          />
          <InputBox
            name='password'
            type='password'
            placeholder='senha'
            icon='fi-rr-key'
          />

          <button
            className='btn-dark center mt-14'
            type='submit'
            onClick={handleSubmit}
          >
            {type.replace("-", "")}
          </button>
          <div className='relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold'>
            <hr className='w-1/2 border-black' />
            <p>or</p>
            <hr className='w-1/2 border-black' />
          </div>
          <button
            className='btn-dark flex items-center justify-center gap-4 w-[90%] center'
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} />
            continue com google
          </button>
          {type == "sign-in" ? (
            <p className='mt-6 text-dark-grey text-xl text-center'>
              Dont have an account?
              <Link to='/signup' className='underline text-black text-xl ml-1'>
                Join us
              </Link>
            </p>
          ) : (
            <p className='mt-6 text-dark-grey text-xl text-center'>
              Already a member?
              <Link to='/signup' className='underline text-black text-xl ml-1'>
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
