const token =
  "EAAKZAmSAAO3oBPEQQZCPEJ9yjxbcGNGaQl81YZBS8vctnBq1Twfy914j5i1cRFkOZCJn2TApwlT7gODUH6EGJSvhhULCgm9gd3WwS1Pde5uWKlAqe590Hb9Y5MnkNFsnp12NPZCsJk0bny82HdztV8ZCjojZChvoC27QciZBhGXU1dH6jrpOtGPZCZBkmW7jTjWItorJtElqNhQkjFvloqcyHlyXqVgKZBfCaIxc6EgMZCWQffIhdt4OwoHR6iqsJAZDZD";

async function debugToken() {
  try {
    console.log('Checking token validity...');
    const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Token error:', data.error);
    } else {
      console.log('Token is valid for user:', data.name, 'ID:', data.id);
    }
    
    console.log('\nChecking permissions...');
    const permResponse = await fetch(`https://graph.facebook.com/me/permissions?access_token=${token}`);
    const permData = await permResponse.json();
    
    if (permData.error) {
      console.error('Permissions error:', permData.error);
    } else {
      console.log('Granted permissions:');
      permData.data.forEach(perm => {
        if (perm.status === 'granted') {
          console.log(`- ${perm.permission}`);
        }
      });
    }
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugToken();