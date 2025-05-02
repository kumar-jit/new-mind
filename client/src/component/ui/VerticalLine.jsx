export default function VerticalLine({
    size = "parent",
    gap = "25px",
    color = "#DDDDDD",
}) {
    return (
        <div
            className="flex items-center justify-center"
            style={{ height: "parent", width: gap, overflow: "hidden" }}
        >
            <div
                style={{
                    borderLeft: "0.5px solid ",
                    borderColor: color,
                    height: size,
                }}
            ></div>
        </div>
    );
}
