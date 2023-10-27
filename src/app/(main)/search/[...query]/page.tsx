export default function SearchResultsPage({
  params: { query },
}: {
  params: { query: string[] };
}) {
  return (
    <div className="px-6 pt-[64px]">
      Search Results Page
      <p>Query: {query.map(decodeURIComponent)}</p>
    </div>
  );
}
