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








// export class ApiService {
//   private static BASE_URL = 'http://65.2.50.195/dev/coral/do_superviser1.php';

//   static async sendOtp(supervisorId: string) {
//     console.log('='.repeat(50));
//     console.log('🔵 STARTING OTP REQUEST');
//     console.log('='.repeat(50));
    
//     try {
//       console.log('📊 REQUEST DETAILS:');
//       console.log('  - Supervisor ID:', supervisorId);
//       console.log('  - Supervisor ID Length:', supervisorId.length);
//       console.log('  - Is Empty?', supervisorId.trim() === '');
//       console.log('  - Request URL:', `${this.BASE_URL}?type=OTP_GENERATION`);
//       console.log('  - Method: POST');
//       console.log('  - Content-Type: application/json');
      
//       const requestBody = {
//         reqType: 'OTP_GENERATION',
//         supervisorId: supervisorId.trim()
//       };
      
//       console.log('📤 REQUEST BODY:');
//       console.log(JSON.stringify(requestBody, null, 2));
      
//       console.log('🔄 Making fetch request...');
//       const startTime = Date.now();
      
//       const response = await fetch(`${this.BASE_URL}?type=OTP_GENERATION`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody)
//       });
      
//       const endTime = Date.now();
//       console.log(`⏱️ Request completed in ${endTime - startTime}ms`);
      
//       console.log('📨 RESPONSE DETAILS:');
//       console.log('  - Status:', response.status);
//       console.log('  - Status Text:', response.statusText);
//       console.log('  - OK:', response.ok);
      
//       // Log response headers
//       console.log('📋 RESPONSE HEADERS:');
//       response.headers.forEach((value, key) => {
//         console.log(`  - ${key}: ${value}`);
//       });
      
//       console.log('📥 Getting response text...');
//       const text = await response.text();
      
//       console.log('📄 RAW RESPONSE:');
//       console.log('Length:', text.length);
//       console.log('First 500 chars:', text.substring(0, 500));
//       console.log('Full response:', text);
      
//       let data;
//       try {
//         console.log('🔄 Parsing JSON...');
//         data = JSON.parse(text);
//         console.log('✅ JSON parsed successfully');
        
//         console.log('📊 PARSED RESPONSE:');
//         console.log(JSON.stringify(data, null, 2));
        
//         if (data.success) {
//           console.log('🎉 API call successful!');
//           if (data.tempToken) {
//             console.log('🔑 Temp token received:', data.tempToken.substring(0, 20) + '...');
//           }
//           if (data.debug) {
//             console.log('🐛 Debug info:', data.debug);
//           }
//         } else {
//           console.log('❌ API call failed:', data.message);
//           if (data.debug) {
//             console.log('🐛 Debug info:', data.debug);
//           }
//         }
        
//       } catch (parseError) {
//         console.log('❌ JSON PARSE ERROR:');
//         console.log('Parse error:', parseError);
//         console.log('Response was not valid JSON');
//         console.log('Response content type:', response.headers.get('content-type'));
        
//         // Check if response looks like HTML
//         if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
//           console.log('⚠️ Response appears to be HTML, not JSON');
//           console.log('This usually indicates a server error or wrong endpoint');
//         }
        
//         throw new Error(`Invalid response format: ${parseError.message}`);
//       }
      
//       console.log('='.repeat(50));
//       console.log('🔵 OTP REQUEST COMPLETED');
//       console.log('='.repeat(50));
      
//       return data;
      
//     } catch (error) {
//       console.log('='.repeat(50));
//       console.log('❌ API ERROR OCCURRED');
//       console.log('='.repeat(50));
//       console.log('Error type:', error.constructor.name);
//       console.log('Error message:', error.message);
//       console.log('Full error:', error);
      
//       if (error.name === 'TypeError' && error.message.includes('fetch')) {
//         console.log('🌐 Network error - check internet connection and server URL');
//       }
      
//       throw error;
//     }
//   }

//   static async verifyOtp(supervisorId: string, otp: string, tempToken: string) {
//     console.log('='.repeat(50));
//     console.log('🔵 STARTING OTP VERIFICATION');
//     console.log('='.repeat(50));
    
//     try {
//       console.log('📊 VERIFICATION DETAILS:');
//       console.log('  - Supervisor ID:', supervisorId);
//       console.log('  - OTP:', otp);
//       console.log('  - Temp Token:', tempToken ? (tempToken.substring(0, 20) + '...') : 'null');
      
//       const requestBody = {
//         reqType: 'OTP_VALIDATION',
//         supervisorId: supervisorId,
//         otp: otp,
//         tempToken: tempToken
//       };
      
//       console.log('📤 REQUEST BODY:');
//       console.log(JSON.stringify(requestBody, null, 2));
      
//       const response = await fetch(`${this.BASE_URL}?type=OTP_VALIDATION`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody)
//       });

//       console.log('📨 VERIFICATION RESPONSE:');
//       console.log('  - Status:', response.status);
//       console.log('  - OK:', response.ok);

//       const text = await response.text();
//       console.log('📄 Raw verification response:', text);
      
//       const data = JSON.parse(text);
//       console.log('📊 Parsed verification response:', JSON.stringify(data, null, 2));
      
//       return data;
      
//     } catch (error) {
//       console.log('❌ OTP VERIFICATION ERROR:', error);
//       throw error;
//     }
//   }
// }

