import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor.pages";

const PublishForm = () => {
  let characterLimit = 200;
  let tagLimit = 2;
  let {
    blog: { banner, title, tags, des },
    setEditorState,
  } = useContext(EditorContext);
  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleBlogDescChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, des: input.value });
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();

      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`you can add max ${tagLimit}`);
      }
      e.target.value = "";
    }
  };

  return (
    <AnimationWrapper>
      <section>
        <Toaster />
        <button
          className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]'
          onClick={handleCloseEvent}
        >
          <i className='fi fi-br-cross'></i>
        </button>

        <div className='mas-w-[550px] center'>
          <p className='text-dark-grey mb-1'>Preview</p>
          <div className='w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4'>
            <img src={banner} />
          </div>

          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2'>
            {title}
          </h1>
          <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>
            {desc}
          </p>
        </div>
        <div className='border-grey lg:border-1 lg:pl-8'>
          <p className='text-dark-grey mb-2 mt-9'>Blog Title</p>
          <input
            type='text'
            placeholder='Blog title'
            defaultValue={title}
            className='input-box pl-4'
            onChange={handleBlogTitleChange}
          />
          <p className='text-dark-grey mb-2 mt-9'>
            Short description about your blog
          </p>
          <textarea
            maxLength={characterLimit}
            defaultValue={desc}
            className='h-40 resize-none leading-7 input-box pl-4'
            onChange={handleBlogDescChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>

          <p className='mt-1 text-dark-grey text-sm text-right'>
            {characterLimit - des.length}characters left
          </p>
          <p className='text-dark-grey mb-2 mt-9'>
            Topics - (helps is searching and ranking your blog post)
          </p>
          <div className='relative input-box pl-2 py-2 pb-4'>
            <input
              type='text'
              placeholder='Topic'
              className='sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white'
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => {
              return <Tag tag={tag} tagIndex={i} key={i} />;
            })}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
