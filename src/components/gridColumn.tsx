export default function durasi({ data }: { data: number[] }) {
  const value = data;
  return (
    <>
      <div className={`grid grid-cols-96 grid-rows-${value} gap-0`}>
        <div className={`col-start-${value} col-end-${value}`}></div>
      </div>
    </>
  );
}
