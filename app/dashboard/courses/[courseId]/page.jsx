import VidPlayerBox from "@/components/atoms/dashboard/vid-player-box";


export default async function Page({ params }) {
  const { courseId } = params;
  // const course = await getCourseById(courseId);

  // if (!course) return notFound();

  return (
      <div className="w-full ">
        <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Watch Lesson</h2>
      <VidPlayerBox/>
    </div>
      </div>

  );
}

