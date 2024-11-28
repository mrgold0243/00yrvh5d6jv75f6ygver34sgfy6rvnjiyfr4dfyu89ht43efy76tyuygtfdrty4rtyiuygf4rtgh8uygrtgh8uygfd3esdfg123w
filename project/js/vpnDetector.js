export class VPNDetector {
  static async detectVPN() {
    let vpnDetected = false;
    const localIPs = new Set();
    
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      
      pc.createDataChannel("");
      await pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      return new Promise((resolve) => {
        pc.onicecandidate = async (event) => {
          if (!event.candidate) {
            pc.close();
            vpnDetected = localIPs.size > 1;
            resolve(await VPNDetector.checkIPGeolocation(vpnDetected));
          } else if (event.candidate.candidate) {
            const regexResult = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
              .exec(event.candidate.candidate);
            if (regexResult) {
              localIPs.add(regexResult[1]);
            }
          }
        };
      });
    } catch (error) {
      return true; // Assume VPN if detection fails
    }
  }

  static async checkIPGeolocation(initialVPNStatus) {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (!ipResponse.ok) throw new Error('IP check failed');
      
      const { ip } = await ipResponse.json();
      
      const geoResponse = await fetch('https://extreme-ip-lookup.com/json/' + ip);
      if (!geoResponse.ok) throw new Error('Geolocation check failed');
      
      const data = await geoResponse.json();
      
      return (
        initialVPNStatus ||
        data.ipType === 'VPN' ||
        data.ipType === 'Proxy' ||
        data.ipName?.toLowerCase().includes('vpn') ||
        data.isp?.toLowerCase().includes('vpn') ||
        data.org?.toLowerCase().includes('vpn') ||
        data.hosting === true ||
        data.proxy === true ||
        /datacenter|hosting|cloud|vpn|proxy/i.test(data.org || '') ||
        /datacenter|hosting|cloud|vpn|proxy/i.test(data.isp || '')
      );
    } catch (error) {
      return true; // Assume VPN if checks fail
    }
  }
}