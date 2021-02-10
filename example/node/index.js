const { verifierFactory } = require('@southlane/cognito-jwt-verifier')

async function main() {
  const verify = verifierFactory({
    region: 'us-east-1',
    userPoolId: 'us-east-1_eB1Xdqe4i',
    appClientId: '11tk4h9tul8n81u9uv4nmpo5sn',
    tokenType: 'access', // either "access" or "id"
  })

  const token =
    'eyJraWQiOiI0UHZLaGtsbTAxNWQ4YXJsOFRJWUhpcFRUU05oWmhiemNFVFN4c0U0UW1vPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiampZMlFkQ0ZBdFNROXF2Vk96WXgwdyIsInN1YiI6IjEyMDM0MzFhLWJhNzMtNDM1Ni1iYjZjLThjNTZiYzI4OTUwMyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9lQjFYZHFlNGkiLCJjb2duaXRvOnVzZXJuYW1lIjoiMTIwMzQzMWEtYmE3My00MzU2LWJiNmMtOGM1NmJjMjg5NTAzIiwiYXVkIjoiMTF0azRoOXR1bDhuODF1OXV2NG5tcG81c24iLCJldmVudF9pZCI6ImIxNWJmZjBhLWM5NDAtNGU2NC1iOGQ4LTAwNzViNjY3NmQxOCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjA4Njg0OTM3LCJuYW1lIjoiTWF4IiwiZXhwIjoxNjA4Njg4NTM3LCJpYXQiOjE2MDg2ODQ5MzcsImVtYWlsIjoiaGVsbG9AbWF4aXZhbm92LmlvIn0.Ikkzy8sE-SCFVhtUrtQlDzR4JE5qIC3-XR_IOrbKw2jkOTf-ziL9og06X0OVfhpOKipKB7sBR4gs0P1I63qP_j-q0L3a8g_Fy81qxwtVfd64j2bXs__5gzZupmX2DEkOfAugCmIi-kHKQwynmHCT6X-C8GLqnqILqmphi6du_pIexVEDpMQfBAz2PhN12x35iKKT1ejv4bDrYJ0ZHYpmjytwNnVHJvI0jzODz7pDglnURXAJ1mxdaSgMw4WsEIdZlooNnRtWOeJeXCBMDyO70QSV4lV_G6SnCqh73h_WTMZaOYoj09I54fuyrw1e7lq-wnGOPAALpzkquX992bOlYw'

  try {
    const tokenPayload = await verify(token)
    console.log('Token payload', tokenPayload)
  } catch (e) {
    console.log('Error', e)
  }
}

;(async () => {
  await main()
})()
