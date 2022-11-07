const makeFetch = require('make-fetch')
const Gopher = require('gopher-lib')

module.exports = function makeGopherFetch(opts = {}){
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

    const fetch = makeFetch(async (request) => {
        const { url, method, headers: reqHeaders, body, signal } = request
        if(signal){
          signal.addEventListener('abort', takeCareOfIt)
        }
    
        try {
          const gopherReq = new URL(url)
    
          if (gopherReq.protocol !== 'gopher:' || !method || method !== 'GET') {
            return sendTheData(signal, { statusCode: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' }, data: [Buffer.from('query is incorrect')] })
          }

          if(gopherReq.hostname === '_'){
            return sendTheData(signal, { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, data: ['works'] })
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
            
            return sendTheData(signal, {statusCode: 200, headers: {'Content-Type': 'text/plain'}, data: [mainData.text]})
        } catch(e){
          return sendTheData(signal, {statusCode: 500, headers: {'Content-Type': 'text/plain'}, data: [JSON.stringify(e.stack)]})
        }
    }
    )

    return fetch
}