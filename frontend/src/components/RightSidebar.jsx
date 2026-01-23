export default function RightSidebar() {
    return (
        <div className="p-4 space-y-8">
            <h3>Right Sidebar</h3>

            <section className="space-y-2">
                <h4 className="font-semibold">Trending Posts</h4>
                <p> Post A</p>
                <p> Post B</p>
            </section>

            <section className="space-y-2">
                <h4 className="font-semibold">Upcoming Events</h4>
                <p> Event A</p>
                <p> Event B</p>
            </section>

            <section className="space-y-2">
                <h4 className="font-semibold">Club Highlights</h4>
                <p> Club A</p>
                <p> Club B</p>
            </section>
        </div>
    );
}