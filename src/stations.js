// Where each station sits in the office and where the camera goes when it is opened.
export const STATIONS = {
  about: { position: [1.5, 0, 3.5], focus: { target: [1.5, 1.1, 3.3], camera: [5.5, 4.2, 9] } },
  'asset-hub': { position: [-7, 0, -6], focus: { target: [-7, 1.8, -6.6], camera: [-3.6, 4.4, 0.8] } },
  'anomaly-alerts': { position: [0, 0, -6.5], focus: { target: [0, 1.8, -7.2], camera: [3, 4.3, 0] } },
  'customer-insights': { position: [7, 0, 4.2], focus: { target: [7, 1.2, 4], camera: [11.3, 5, 9.8] } },
  'promo-radar': { position: [7, 0, -5], focus: { target: [8.2, 1.8, -3], camera: [13.5, 6, 5] } },
  'farm-ledger': { position: [-9.6, 0, 5.2], focus: { target: [-15, 1.2, 3.5], camera: [-3.5, 6.5, 13] } },
  skills: { position: [-12, 0, 0.5], focus: { target: [-11.9, 2.3, 0.5], camera: [-5.6, 3, 1.4] } },
  contact: { position: [10.5, 0, -9], focus: { target: [10.5, 1.7, -8.6], camera: [9.6, 3.2, -2.4] } },
};

// Extra camera viewpoints that are not case studies.
export const SPOTS = {
  chicks: { label: 'Chick Ranges', target: [13, 0.5, -24], camera: [17, 10, -9] },
};

export const HOME = {
  wide: { target: [-3.5, 0.3, -0.6], camera: [18, 18, 22.5] },
  tall: { target: [0.5, 0, 0.5], camera: [28, 31, 35] },
};
