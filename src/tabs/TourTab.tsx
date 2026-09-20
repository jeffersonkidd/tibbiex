import { SHOWS } from "../content/shows"
import ShowRow from "../ui/rows/ShowRow"

export default function TourTab() {
  return SHOWS.map((show) => <ShowRow key={show.id} show={show} />)
}
