import AnimationWrapper from "../common/page-animation";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);

  const fetchLatestBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
      .then(({ data }) => {
        setBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <AnimationWrapper>
      <section className='h-cover flex justify-center gap-10'>
        <div className='w-full'>
          <InPageNavigation
            router={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : (
                blogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </>
          </InPageNavigation>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
