import BukhakHallBuilding from './BukhakHallBuilding'
import BukhakHallDecorations from './BukhakHallDecorations'
import LeftAnnexBuilding from './LeftAnnexBuilding'
import BukhakRightWing from './BukhakRightWing'
import { BUKHAK_HALL_ISLAND } from '../config/bukhakHallLayout'

export default function BukhakHall({ onGS25Click, onBukakClick, onRightWingClick, onBus1164Click, onBus2115Click }) {
  return (
    <>
      {/* Top-level campus cluster. Object placement lives in bukhakHallLayout.js. */}
      <BukhakHallBuilding building={BUKHAK_HALL_ISLAND.building} onClick={onBukakClick} />
      <BukhakRightWing rightWing={BUKHAK_HALL_ISLAND.rightWing} onClick={onRightWingClick} />
      <LeftAnnexBuilding annex={BUKHAK_HALL_ISLAND.leftAnnexBuilding} />
      <BukhakHallDecorations
        island={BUKHAK_HALL_ISLAND}
        onGS25Click={onGS25Click}
        onBus1164Click={onBus1164Click}
        onBus2115Click={onBus2115Click}
      />
    </>
  )
}
