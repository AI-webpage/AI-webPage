import { BUKHAK_BUILDING_SIZE } from './bukhakHallDesign'

// Top-level placement controls for the Bukhak Hall campus cluster.
export const BUKHAK_HALL_ISLAND = {
  building: {
    position: [0, 0, -10],
    ...BUKHAK_BUILDING_SIZE,
  },
  rightWing: {
    position: [10, 0, 1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  leftAnnexBuilding: {
    position: [-11, 0, 5],
    rotation: [0, Math.PI / 2, 0],
    scale: [1, 1, 1],
  },
  buses: [
    {
      position: [-9, 0.1, 4],
      rotation: [0, 0, 0],
      routeNumber: '1164',
    },
    {
      position: [-9, 0.1, 6],
      rotation: [0, 0, 0],
      routeNumber: '1164',
    },
    {
      position: [7, 0.1, 15],
      rotation: [0, -Math.PI / 2, 0],
      routeNumber: '2115',
    },
  ],
  busStopSign: {
    position: [-12, 0.08, 7],
    rotation: [0, 0, 0],
  },
  convenienceStore: {
    position: [-7, 0.08, 0],
    rotation: [0, -Math.PI / 2, 0],
  },
  stairPlanters: {
    position: [0, 0, 1.52],
    sideOffset: 3.3,
  },
}
