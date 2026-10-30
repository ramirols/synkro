export default function MetricCard({

    title,
    value

}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-3xlborderbg-cardp-6transitionhover:shadow-lg">
            <p className="text-sm text-muted-foreground">
                {title}
            </p>

            <p className="mt-4 text-4xl font-semiboldtracking-tight">
                {value}
            </p>
        </div>
    )
}