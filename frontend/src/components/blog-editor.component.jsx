import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { uploadImage } from "../common/aws";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";

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

  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holderId: "textEditor",
        data: content,
        tools: tools,
        placeholder: "let's write an awesome story",
      })
    );
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
    img.src = defaultBanner;
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

  return (
    <>
      <nav className='navbar'>
        <Link to='/' className='flex-none w-10'>
          <img src={logo} />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full'>
          {title.length ? title : "New Blog"}
        </p>
        <div className='flex gap-4 ml-auto'>
          <button className='btn-dark py-2' onClick={handlePublishEvent}>
            Publish
          </button>
          <button className='btn-light py-2'>Save draft</button>
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
