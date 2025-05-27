export const ProfilePageSkeleton = () => {
    return (
      <div className='animate-pulse mt-8 max-w-[95vw] min-h-[100vh] lsx:max-w-auto'>
        <div className='flex w-full mb-8 justify-between'>
          <div className='flex w-full'>
            <div className='rounded-full h-28 w-28 bg-gray-300 mr-7' />
            <div className='flex  flex-col justify-around'>
              <div className='h-5 bg-gray-300 w-36 mb-2' />
              <div className='h-5 bg-gray-300 w-40' />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='rounded-full border border-wmt-green-100 p-2 items-center justify-center h-10 w-10 bg-gray-300' />
            <div className='rounded-full border border-wmt-green-100 p-2 items-center justify-center h-10 w-10 bg-gray-300' />
          </div>
        </div>
        <div className='flex justify-between mb-8'>
          <section className='p-6 flex border-wmt-line-gray border-2 rounded-lg w-9/12'>
            <div className='h-12 w-24 bg-gray-300 rounded mb-2 mr-3' />
            <div className='h-12 w-24 bg-gray-300 rounded mb-2 mr-3' />
            <div className='h-12 w-24 bg-gray-300 rounded mb-2 mr-3' />
            <div className='h-12 w-24 bg-gray-300 rounded' />
          </section>
          <div className='flex flex-col text-right justify-center'>
            <div className='h-12 w-24 bg-gray-300 rounded mb-2' />
            <div className='h-5 bg-gray-300 w-16' />
          </div>
        </div>
        <div className='flex w-full flex-wrap'>
          <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
          <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
          <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
          <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
          <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
        </div>
        <div className='w-full space-y-8'>
          <div className='h-8 bg-gray-300 rounded mb-2' />
          <div className='flex w-full flex-wrap'>
            <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
            <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
            <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
            <div className='h-8 bg-gray-300 rounded mb-2' />
          </div>
          <div className='h-8 bg-gray-300 rounded mb-2' />
          <div className='flex w-full flex-wrap'>
            <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
            <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
            <div className='h-8 bg-gray-300 rounded mr-2 mb-2' />
            <div className='h-8 bg-gray-300 rounded mb-2' />
          </div>
          <div className='flex justify-end gap-3.5'>
            <div className='h-10 w-36 bg-gray-300 rounded-full mr-2' />
            <div className='h-10 w-28 bg-gray-300 rounded-full' />
          </div>
        </div>
      </div>
    );
  }