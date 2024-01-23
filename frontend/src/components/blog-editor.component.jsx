import { Link, useNavigate } from "react-router-dom";
import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import lightBanner from "../imgs/blog banner light.png";
import darkBanner from "../imgs/blog banner dark.png";
import defaultBanner from "../imgs/blog banner.png";
import { uploadImage } from "../common/cloudinary";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { useContext } from "react";
import { ThemeContext } from "../App";

const BlogEditor = () => {
  // let blogBannerRef = useRef();
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
  let { theme } = useContext(ThemeContext);
  let { blog_id } = useParams();

  let navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holderId: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "let's write an awesome story",
        })
      );
    }
  });
  const handleBannerUpload = (e) => {
    let img = e.target.files[0];

    if (img) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Upload");
            // blogBannerRef.current.src = url;

            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
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
    img.src = theme == "light" ? lightBanner : darkBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("upload a blog banner to publish it");
    }

    if (!title.length) {
      return toast.error("write blog title to publish it");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("write something in your blog to publish it");
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
      return toast.error("write blog title before publishing");
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `write a description about your blog withing ${characterLimit} characteres to publish`
      );
    }
    if (!tags.length) {
      return toast.error("enter at least 1 tag to help us rank your blog");
    }
    let loadingToast = toast.loading("Saving draft...");
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
            toast.success("saved");

            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            return toast.error(response.data.error);
          });
      });
    }
  };
  return (
    <>
      <nav className='navbar'>
        <Link to='/' className='flex-none w-10'>
          <img src={theme == "light" ? darkLogo : lightLogo} />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full'>
          {title.length ? title : "New Blog"}
        </p>
        <div className='flex gap-4 ml-auto'>
          <button className='btn-dark py-2' onClick={handlePublishEvent}>
            Publish
          </button>
          <button className='btn-light py-2' onClick={handleSaveDraft}>
            Save draft
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
          <div className='mx-auto max-w-[900px] w-full'>
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
              placeholder='Blog Title'
              className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white'
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
