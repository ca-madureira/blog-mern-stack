const LoadMoreDataBtn = ({ state, fetchDataFun }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button className='text-dark-grey p-2 px-3 hover:bg-grey/50 rounded-md flex items-center gap-2'>
        Load more
      </button>
    );
  }
};

export default LoadMoreDataBtn;
