import type { HNEntry } from "@/lib/scraper";

interface EntryTableProps {
  entries: HNEntry[];
}

export function EntryTable({ entries }: EntryTableProps) {
  if (entries.length === 0) {
    return <p className="entry-table-empty">No entries match this filter.</p>;
  }

  return (
    <table className="entry-table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Title</th>
          <th scope="col">Points</th>
          <th scope="col">Comments</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.rank}>
            <td className="entry-table-rank">{entry.rank}</td>
            <td className="entry-table-title">{entry.title}</td>
            <td className="entry-table-number">{entry.points}</td>
            <td className="entry-table-number">{entry.comments}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}