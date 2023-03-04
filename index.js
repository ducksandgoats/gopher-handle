module.exports = async function makeGopherFetch(opts = {}) {
  const { makeRoutedFetch } = await import('make-fetch')
  const {fetch, router} = makeRoutedFetch({onNotFound: handleEmpty, onError: handleError})
    const Gopher = require('gopher-lib')
    const DEFAULT_OPTS = {}
  const finalOpts = { ...DEFAULT_OPTS, ...opts }
  const useTimeOut = finalOpts.timeout
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

  async function handleData(timeout, data) {
    if (timeout) {
      return await Promise.race([
        new Promise((resolve, reject) => setTimeout(() => { const err = new Error('timed out'); err.name = 'timeout'; reject(err) }, timeout)),
        data
      ])
    } else {
      return await data
    }
  }

  function makeQuery(link) {
    return new Promise((resolve, reject) => {
      gopher.get(link, (err, reply)=>{
          if(err) {
              reject(err);
          } else {
            if (reply.text) {
              resolve(reply.text)
            } else {
              resolve('')
            }
          }
        });
    })
  }

  router.get('gopher://*/**', async function (request) {
      const { url, method, headers: reqHeaders, body, signal, referrer } = request
      if(signal){
        signal.addEventListener('abort', takeCareOfIt)
    }
          const gopherReq = new URL(url, referrer)

          if(gopherReq.hostname === '_'){
            return sendTheData(signal, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'works' })
    }
    
      if (!gopherReq.hostname.startsWith('gopher.')) {
        gopherReq.hostname = 'gopher.' + gopherReq.hostname
      }
    
    const mainTimeout = reqHeaders.has('x-timer') || gopherReq.searchParams.has('x-timer') ? reqHeaders.get('x-timer') !== '0' || gopherReq.searchParams.get('x-timer') !== '0' ? Number(reqHeaders.get('x-timer') || gopherReq.searchParams.get('x-timer')) * 1000 : undefined : useTimeOut
            
            return sendTheData(signal, {status: 200, headers: {'Content-Type': 'text/plain'}, body: await handleData(mainTimeout, makeQuery(gopherReq.href))})
  })

    return fetch
}