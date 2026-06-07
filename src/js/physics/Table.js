import { PHYSICS } from '../core/Constants.js';

export class Table {
  constructor() {
    this.width = PHYSICS.TABLE_WIDTH;
    this.length = PHYSICS.TABLE_LENGTH;
    this.height = PHYSICS.TABLE_HEIGHT;
    this.netHeight = PHYSICS.NET_HEIGHT;
    this.netOverhang = PHYSICS.NET_OVERHANG;
    this.halfW = this.width / 2;
    this.halfL = this.length / 2;
  }

  getBounds() {
    return {
      minX: -this.halfW, maxX: this.halfW,
      minZ: -this.halfL, maxZ: this.halfL,
      height: this.height, netHeight: this.netHeight, netOverhang: this.netOverhang,
    };
  }

  isAboveTable(x, z) {
    return Math.abs(x) <= this.halfW && Math.abs(z) <= this.halfL;
  }

  sideForZ(z) {
    if (z > 0) return 'player_1';
    if (z < 0) return 'player_2';
    return 'none';
  }
}
