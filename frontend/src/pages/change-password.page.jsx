import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { useRef, useContext } from "react";
import { toast, Toaster } from "react-hot-toast";

const ChangePassword = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let changePasswordForm = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(changePasswordForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;

    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Preencha todos os campos");
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "A senha deve ter de 6 a 20 caracteres com um número, 1 letra minúscula e 1 letra maiúscula"
      );
    }

    e.target.setAttribute("disabled", true);
    let loadingToast = toast.loading("Atualizando...");

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("senha atualizada");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm}>
        <h1 className='max-md:hidden'>Alterar Senha</h1>
        <div className='py-10 w-full md:max-w-[400px]'>
          <InputBox
            name='currentPassword'
            type='password'
            className='profile-edit-input'
            placeholder='Senha atual'
            icon='fi-rr-unlock'
          />
          <InputBox
            name='newPassword'
            type='password'
            className='profile-edit-input'
            placeholder='Nova senha'
            icon='fi-rr-unlock'
          />
          <button
            onClick={handleSubmit}
            className='btn-dark px-10'
            type='submit'
          >
            Alterar Senha
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
