import BukhakHallBuilding from './BukhakHallBuilding'
import BukhakHallDecorations from './BukhakHallDecorations'
import LeftAnnexBuilding from './LeftAnnexBuilding'
import BukhakRightWing from './BukhakRightWing'
import { BUKHAK_HALL_ISLAND } from '../config/bukhakHallLayout'

export default function BukhakHall() {
  return (
    <>
      {/* Top-level campus cluster. Object placement lives in bukhakHallLayout.js. */}
      <BukhakHallBuilding building={BUKHAK_HALL_ISLAND.building} />
      <BukhakRightWing rightWing={BUKHAK_HALL_ISLAND.rightWing} />
      <LeftAnnexBuilding annex={BUKHAK_HALL_ISLAND.leftAnnexBuilding} />
      <BukhakHallDecorations island={BUKHAK_HALL_ISLAND} />
    </>
  )
}
