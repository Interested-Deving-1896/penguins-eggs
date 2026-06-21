export interface ITftpOptions {
  denyPUT: boolean
  host: string
  port: number
  root: string
}

export interface IDhcpOptions {
  bios_filename: string
  broadcast: string
  efi32_filename: string
  efi64_filename: string
  host: string
  subnet: string
  tftpserver: string
}

export interface IDhcpd {
  discover: (pkt: IPacket) => void
  inform: (pkt: IPacket) => void
  pre_init: (pkt: IPacket) => void
  proxy_request: (pkt: IPacket) => IPacket
  request: (pkt: IPacket) => void
}

export interface IProxy {
  bind: (port: number, addr: string, cb: any) => IPacket
}

export interface IServer {
  bind: (port: number, addr: string, cb: any) => IPacket
}

export interface IPacket {
  chaddr: (chaddr: any) => IPacket
  ciaddr: (ciaddr: string) => IPacket
  flags: (flags: any) => IPacket
  fname: (fname: any) => IPacket
  getRequestedIPAddress: () => string
  giaddr: (giaddr: string) => IPacket
  hlen: (hlen: any) => IPacket
  hops: (hops: any) => IPacket
  htype: (htype: any) => IPacket
  op: (op: any) => IPacket
  options: (options: any) => IPacket
  secs: (secs: any) => IPacket
  siaddr: (siaddr: string) => IPacket
  sname: (sname: any) => IPacket
  xid: (xid: any) => IPacket
}
