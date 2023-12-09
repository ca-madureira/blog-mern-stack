import { useEffect } from "react";
import AnimationWrapper from "../common/page-animation";
import { activeTabRef } from "../components/inpage-navigation.component";
const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = [
    "programacao",
    "cinema",
    "redes sociais",
    "receitas",
    "tecnologia",
    "financas",
    "viagens",
  ];
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

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState == "home") {
      fetchLatestBlogs();
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);
  return (
    <AnimationWrapper>
      <section className='h-cover flex justify-center gap-10'>
        <div className='w-full'>
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
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
            {trendingBlogs == null ? (
              <Loader />
            ) : (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            )}
          </InPageNavigation>
        </div>
        <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-5 max-md:hidden'>
          <div className='flex flex-col gap-10'>
            <h1 className='font-medium text-xl mb-8'>
              Stories form all interest
            </h1>
            <div className='flex gap-3 flex-wrap'>
              {categories.map((category, i) => {
                return (
                  <button
                    onClick={loadBlogByCategory}
                    className={
                      "tag" +
                      (pageState == category ? "bg-black text-white" : "")
                    }
                    key={i}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h1 className='font-medium text-xl mb-8'>
              Trending<i className='fi fi-rr-arrow-trend-up'></i>
            </h1>
            {trendingBlogs.map((blog, i) => {
              return (
                <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }}>
                  <MinimalBlogPost blog={blog} index={i} />
                </AnimationWrapper>
              );
            })}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;