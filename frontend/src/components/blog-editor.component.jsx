import { Link, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog banner.png";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import axios from "axios";
import { UserContext } from "../App";
import { useParams } from "react-router-dom";

const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let { blog_id } = useParams();

  let navigate = useNavigate();

  useEffect(() => {
    // if (textEditor.isReady) {
    setTextEditor(
      new EditorJS({
        holder: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        placeholder: "Escreva algo",
      })
    );
    // }
  }, []);
  const handleBannerUpload = async (e) => {
    let img = e.target.files[0];

    if (img) {
      let loadingToast = toast.loading("Carregando...");

      // Crie um novo objeto FormData para enviar a imagem
      const formData = new FormData();
      formData.append("file", img);
      formData.append("upload_preset", "blog-banner"); // Substitua com seu upload_preset
      formData.append("cloud_name", "dsrwye3fj");

      try {
        // Correção na linha abaixo: uso correto de template string
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dsrwye3fj/image/upload?upload_preset=blog-banner`,
          {
            method: "POST",
            body: formData,
          }
        );
        toast.dismiss(loadingToast);
        toast.success("Carregado");
        const cloudData = await response.json();
        setBlog({ ...blog, banner: cloudData.url });
        // Restante do código para lidar com a resposta da requisição
      } catch (error) {
        console.error("Erro ao fazer o upload para o Cloudinary:", error);
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("carregue uma imagem");
    }

    if (!title.length) {
      return toast.error("escreva o titulo");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error(
              "escreva alguma coisa em seu blog para publicar"
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Escreva um titulo antes de salvar");
    }

    let loadingToast = toast.loading("Salvando rascunho...");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };

        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
            { ...blogObj, id: blog_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then(() => {
            e.target.classList.remove("disable");

            toast.dismiss(loadingToast);
            toast.success("Rascunho salvo");

            setTimeout(() => {
              navigate("/");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            toast.error(response.data.error);
            return;
          });
      });
    }
  };
  return (
    <>
      <nav className='navbar'>
        <Link to='/' className='flex-none w-10'>
          <img src={logo} />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full'>
          {title.length ? title : "Novo"}
        </p>
        <div className='flex gap-4 ml-auto'>
          <button className='btn-dark py-2' onClick={handlePublishEvent}>
            Publicar
          </button>
          <button className='btn-light py-2' onClick={handleSaveDraft}>
            Salvar rascunho
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className='max-auto max-w-[900px] w-full'>
            <div className='relative aspect-video hover:opacity-80 bg-white border-4 border-grey'>
              <label htmlFor='uploadBanner'>
                <img src={banner} className='z-20' onError={handleError} />
                <input
                  id='uploadBanner'
                  type='file'
                  accept='.png .jpg .jpeg'
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder='Titulo'
              className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className='w-full opacity-10 my-5' />
            <div id='textEditor' className='font-gelasio'></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
