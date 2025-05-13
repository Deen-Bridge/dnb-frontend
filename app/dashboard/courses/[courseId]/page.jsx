export default async function Page({ params }) {
    const { courseId } = await params
    return <div className="text-7xl text-accentflex justify-center items-center ">Course: {courseId}</div>
  }