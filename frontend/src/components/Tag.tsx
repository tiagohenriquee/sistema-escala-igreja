type TagProps = {
  label: string;
  tone?: "default" | "success" | "warning";
};

export function Tag({ label, tone = "default" }: TagProps) {
  return <span className={`tag ${tone}`}>{label}</span>;
}
