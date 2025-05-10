export default function CoursesPage() {
    return (

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0" >
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
       
                <div className="aspect-video rounded-xl bg-accent" />
                <div className="aspect-video rounded-xl bg-accent" />
                <div className="aspect-video rounded-xl bg-accent" />
                <div className="aspect-video rounded-xl bg-accent" />
            </div>
            <div className="min-h-[200vh] flex-1 rounded-xl bg-highlight md:min-h-min" />
        </div >
    );
}