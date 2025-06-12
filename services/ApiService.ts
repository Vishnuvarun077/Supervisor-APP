



export class ApiService {
  private static BASE_URL = 'http://65.2.50.195/dev/coral/do_superviser1.php';

  static async sendOtp(supervisorId: string) {
    console.log('='.repeat(50));
    console.log('🔵 STARTING OTP REQUEST');
    console.log('='.repeat(50));
    
    try {
      console.log('📊 REQUEST DETAILS:');
      console.log('  - Supervisor ID:', supervisorId);
      console.log('  - Request URL:', `${this.BASE_URL}?type=OTP_GENERATION`);
      
      const requestBody = {
        reqType: 'OTP_GENERATION',
        supervisorId: supervisorId.trim()
      };
      
      console.log('📤 REQUEST BODY:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.BASE_URL}?type=OTP_GENERATION`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 RESPONSE STATUS:', response.status);
      
      const text = await response.text();
      console.log('📄 RAW RESPONSE:', text.substring(0, 500));
      
      const data = JSON.parse(text);
      console.log('📊 PARSED RESPONSE:', JSON.stringify(data, null, 2));
      
      return data;
      
    } catch (error) {
      console.log('❌ OTP REQUEST ERROR:', error);
      throw error;
    }
  }

  static async verifyOtp(supervisorId: string, otp: string, tempToken: string) {
    console.log('='.repeat(50));
    console.log('🔵 STARTING OTP VERIFICATION');
    console.log('='.repeat(50));
    
    try {
      console.log('📊 VERIFICATION DETAILS:');
      console.log('  - Supervisor ID:', supervisorId);
      console.log('  - OTP:', otp);
      console.log('  - Temp Token:', tempToken ? (tempToken.substring(0, 20) + '...') : 'null');
      
      const requestBody = {
        reqType: 'OTP_VALIDATION',
        supervisorId: supervisorId,
        otp: otp,
        tempToken: tempToken
      };
      
      console.log('📤 VERIFICATION REQUEST BODY:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.BASE_URL}?type=OTP_VALIDATION`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📨 VERIFICATION RESPONSE STATUS:', response.status);

      const text = await response.text();
      console.log('📄 RAW VERIFICATION RESPONSE:', text.substring(0, 500));
      
      const data = JSON.parse(text);
      console.log('📊 PARSED VERIFICATION RESPONSE:', JSON.stringify(data, null, 2));
      
      return data;
      
    } catch (error) {
      console.log('❌ OTP VERIFICATION ERROR:', error);
      throw error;
    }
  }

  static async getMeterReaders(supervisorId: string, accessToken: string) {
    console.log('='.repeat(50));
    console.log('🔵 FETCHING METER READERS');
    console.log('='.repeat(50));
    
    try {
      console.log('📊 METER READERS REQUEST:');
      console.log('  - Supervisor ID:', supervisorId);
      console.log('  - Access Token:', accessToken ? (accessToken.substring(0, 20) + '...') : 'null');
      
      const requestBody = {
        reqType: 'GET_METER_READERS',
        supervisorId: supervisorId
      };
      
      console.log('📤 METER READERS REQUEST BODY:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.BASE_URL}?type=GET_METER_READERS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📨 METER READERS RESPONSE STATUS:', response.status);

      const text = await response.text();
      console.log('📄 RAW METER READERS RESPONSE:', text.substring(0, 500));
      
      const data = JSON.parse(text);
      console.log('📊 PARSED METER READERS RESPONSE:', JSON.stringify(data, null, 2));
      
      return data;
      
    } catch (error) {
      console.log('❌ METER READERS REQUEST ERROR:', error);
      throw error;
    }
  }
}




