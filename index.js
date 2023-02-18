module.exports = async function makeGopherFetch(opts = {}) {
  const { makeRoutedFetch } = await import('make-fetch')
  const {fetch, router} = makeRoutedFetch({onNotFound: handleEmpty, onError: handleError})
    const Gopher = require('gopher-lib')
    const DEFAULT_OPTS = {}
    const finalOpts = { ...DEFAULT_OPTS, ...opts }
    const gopher = new Gopher.Client(finalOpts)

  function handleEmpty(request) {
    const { url, headers: reqHeaders, method, body, signal } = request
    if(signal){
      signal.removeEventListener('abort', takeCareOfIt)
    }
    
    return {status: 400, headers: {}, body: 'did not find any data'}
  }

  function handleError(e, request) {
    const { url, headers: reqHeaders, method, body, signal } = request
    if(signal){
      signal.removeEventListener('abort', takeCareOfIt)
    }

    return {status: 500, headers: {}, body: e.stack}
  }

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

  router.get('gopher://*/**', async function (request) {
      const { url, method, headers: reqHeaders, body, signal, referrer } = request
      if(signal){
        signal.addEventListener('abort', takeCareOfIt)
    }
          const gopherReq = new URL(url, referrer)

          if(gopherReq.hostname === '_'){
            return sendTheData(signal, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: ['works'] })
    }
    
      if (!gopherReq.hostname.startsWith('gopher.')) {
        gopherReq.hostname = 'gopher.' + gopherReq.hostname
      }

          const mainData = await new Promise((resolve, reject) => {
            gopher.get(gopherReq.href, (err, reply)=>{
                if(err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
              });
            })
            
            return sendTheData(signal, {status: 200, headers: {'Content-Type': 'text/plain'}, body: mainData.text})
  })

    return fetch
}