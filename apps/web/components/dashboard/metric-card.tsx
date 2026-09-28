export default function MetricCard({

    title,
    value

}: {
    title: string;
    value: string;
}) {


    return (

        <div

            className="
rounded-3xl
border
bg-card
p-6
transition
hover:shadow-lg
"

        >


            <p

                className="
text-sm
text-muted-foreground
"

            >

                {title}

            </p>


            <p

                className="
mt-4
text-4xl
font-semibold
tracking-tight
"

            >

                {value}

            </p>


        </div>

    )

}