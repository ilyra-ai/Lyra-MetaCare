interface BluetoothRequestDeviceOptions {
  filters?: Array<{ services?: string[] }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface BluetoothRemoteGATTCharacteristicEventMap {
  characteristicvaluechanged: Event;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value: DataView | null;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener<K extends keyof BluetoothRemoteGATTCharacteristicEventMap>(
    type: K,
    listener: (
      this: BluetoothRemoteGATTCharacteristic,
      ev: BluetoothRemoteGATTCharacteristicEventMap[K]
    ) => unknown
  ): void;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(
    characteristic: string
  ): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDeviceEventMap {
  gattserverdisconnected: Event;
}

interface BluetoothDevice extends EventTarget {
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener<K extends keyof BluetoothDeviceEventMap>(
    type: K,
    listener: (
      this: BluetoothDevice,
      ev: BluetoothDeviceEventMap[K]
    ) => unknown
  ): void;
}

interface Bluetooth {
  requestDevice(
    options?: BluetoothRequestDeviceOptions
  ): Promise<BluetoothDevice>;
}
