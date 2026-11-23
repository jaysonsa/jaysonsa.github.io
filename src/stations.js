// Where each station sits in the office and where the camera goes when it is opened.
export const STATIONS = {
  about: { position: [1.5, 0, 3.5], focus: { target: [1.5, 1.1, 3.3], camera: [5.5, 4.2, 9] } },
  'asset-hub': { position: [-7, 0, -6], focus: { target: [-7, 1.8, -6.6], camera: [-3.6, 4.4, 0.8] } },
  'kpi-sentinel': { position: [0, 0, -6.5], focus: { target: [0, 1.8, -7.2], camera: [3, 4.3, 0] } },
  'promo-radar': { position: [7, 0, -5], focus: { target: [8.2, 1.8, -3], camera: [13.5, 6, 5] } },
  'farm-ledger': { position: [-7.5, 0, 5], focus: { target: [-7, 0.9, 5], camera: [-2.5, 4.5, 10.5] } },
  skills: { position: [-12, 0, 0.5], focus: { target: [-11.9, 2.3, 0.5], camera: [-5.6, 3, 1.4] } },
  contact: { position: [10.5, 0, -9], focus: { target: [10.5, 1.7, -8.6], camera: [9.6, 3.2, -2.4] } },
};

export const HOME = {
  wide: { target: [-0.5, 0.3, -1.8], camera: [13.5, 12, 15] },
  tall: { target: [-0.5, 0, -0.5], camera: [27, 30, 34] },
};
