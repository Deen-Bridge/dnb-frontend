export default async function Page({ params }) {
    const { bookid } = await params
    return <div className="text-7xl text-accentflex justify-center items-center ">
        Booooooks: {bookid}
    </div>
}