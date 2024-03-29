import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";

import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";
import { uploadImage } from "../common/cloudinary";
// import { uploadImage } from "../common/aws";

const EditProfile = () => {
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  let bioLimit = 150;

  let profileImgEle = useRef();
  let editProfileForm = useRef();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  let {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };

  const handleImagePreview = (e) => {
    let img = e.target.files[0];

    profileImgEle.current.src = URL.createObjectURL(img);
    setUpdatedProfileImg(img);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    try {
      if (updatedProfileImg) {
        e.target.setAttribute("disabled", true);

        const image = await uploadImage(updatedProfileImg);

        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
          { cloudData: image }, // Corrige para usar a variável 'image'
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        console.log(data.url);

        let newUserAuth = {
          ...userAuth,
          profile_img: data.url,
        };

        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);

        setUpdatedProfileImg(null);

        e.target.removeAttribute("disabled");
        toast.success("Carregado");
      } else {
        toast.error("Nenhuma imagem selecionada para carregar");
      }
    } catch (error) {
      console.error("Erro no envio ou atualização da imagem:", error);

      e.target.removeAttribute("disabled");
      toast.error("Erro no upload ou atualização da imagem");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("username precisa ter ao menos 3 letras");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio não deve conter mais que ${bioLimit}`);
    }

    let loadingToast = toast.loading("Carregando...");

    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username != data.username) {
          let newUserAuth = { ...userAuth, username: data.username };

          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Perfil atualizado");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm} onSubmit={handleSubmit}>
          <Toaster />
          <h1 className='max-md:hidden '>Editar perfil</h1>
          <div className='flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10'>
            <div className='max-lg:center mb-5'>
              <label
                htmlFor='uploadImg'
                id='profileImgLabel'
                className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden'
              >
                <div className='w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer'>
                  Carregar imagem
                </div>
                <img ref={profileImgEle} src={profile_img} />
              </label>
              <input
                type='file'
                id='uploadImg'
                accept='.jpeg, .png, .jpg'
                hidden
                onChange={handleImagePreview}
              />
              <button
                className='btn-light mt-5 max-lg:center lg:w-full px-10'
                onClick={handleImageUpload}
              >
                Carregar
              </button>
            </div>
            <div className='w-full'>
              <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>
                <div>
                  <InputBox
                    name='fullname'
                    type='text'
                    value={fullname}
                    placeholder='Full name'
                    disable={true}
                    icon='fi-rr-user'
                  />
                </div>
                <div>
                  <InputBox
                    name='email'
                    type='email'
                    value={email}
                    placeholder='Email'
                    disable={true}
                    icon='fi-rr-envelope'
                  />
                </div>
              </div>
              <InputBox
                type='text'
                name='username'
                value={profile_username}
                placeholder='Username'
                icon='fi-rr-at'
              />
              <p className='text-dark-grey -mt-3'>
                O nome de usuário será usado para pesquisar o usuário e ficará
                visível para todos os usuários
              </p>

              <textarea
                name='bio'
                maxLength={bioLimit}
                defaultValue={bio}
                className='input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5'
                placeholder='Bio'
                onChange={handleCharacterChange}
              ></textarea>
              <p className='mt-1 text-dark-grey'>{charactersLeft} caracteres</p>
              <p className='my-6 text-dark-grey'>adicione suas redes sociais</p>
              <div className='md:grid md:grid-cols-2 gap-x-6'>
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type='text'
                      value={link}
                      placeholder='http://'
                      icon={
                        "fi " +
                        (key != "website" ? "fi-brands-" + key : "fi-rr-globe")
                      }
                    />
                  );
                })}
              </div>
              <button className='btn-dark w-auto px-10' type='submit'>
                Atualizar
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
