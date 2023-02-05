module.exports = async function makeGopherFetch(opts = {}) {
  const { makeRoutedFetch } = await import('make-fetch')
  const {fetch, router} = makeRoutedFetch()
    const Gopher = require('gopher-lib')
    const DEFAULT_OPTS = {}
    const finalOpts = { ...DEFAULT_OPTS, ...opts }
    // const SUPPORTED_METHODS = ['HEAD', 'GET', 'POST', 'DELETE']
    const gopher = new Gopher.Client(finalOpts)

    function takeCareOfIt(data){
      console.log(data)
      throw new Error('aborted')
    }

    function sendTheData(theSignal, theData){
      if(theSignal){
        theSignal.removeEventListener('abort', takeCareOfIt)
      }
      return theData
    }
  
  async function handleGopher(request) {
      const { url, method, headers: reqHeaders, body, signal } = request
      if(signal){
        signal.addEventListener('abort', takeCareOfIt)
    }
          const gopherReq = new URL(url)
    
          if (gopherReq.protocol !== 'gopher:' || !method || method !== 'GET') {
            return sendTheData(signal, { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: [Buffer.from('query is incorrect')] })
          }

          if(gopherReq.hostname === '_'){
            return sendTheData(signal, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: ['works'] })
          }
          
          if(!gopherReq.hostname.startsWith('gopher.')){
            gopherReq.hostname = 'gopher.' + gopherReq.hostname
          }

          const mainData = await new Promise((resolve, reject) => {
            gopher.get(gopherReq.toString(), (err, reply)=>{
                if(err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
              });
            })
            
            return sendTheData(signal, {status: 200, headers: {'Content-Type': 'text/plain'}, body: [mainData.text]})
  }

  router.any('gopher://*/**', handleGopher)

    return fetch
}