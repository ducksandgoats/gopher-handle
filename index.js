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
        const { url, method, headers, body, signal } = request
        if(signal){
          signal.addEventListener('abort', takeCareOfIt)
        }
    
        try {
          const gopherReq = new URL(url)
    
          if (gopherReq.protocol !== 'gopher:' || !method || method !== 'GET') {
            return sendTheData(signal, { statusCode: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' }, data: [Buffer.from('query is incorrect')] })
          } else if(!gopherReq.hostname.startsWith('gopher.')){
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
            
            return sendTheData(signal, { statusCode: 200, headers: { 'Content-Type': mainRes }, data: mainReq ? [`<html><head><title>${checkURL}</title></head><body><div><p>${mainData.text}</p></div></body></html>`] : [JSON.stringify(mainData.text)] })
        } catch(e){
          return sendTheData(signal, { statusCode: 500, headers: {'Content-Type': mainRes}, data: mainReq ? [`<html><head><title>${e.name}</title></head><body><div><p>${e.stack}</p></div></body></html>`] : [JSON.stringify(e.stack)]})
        }
    }
    )

    return fetch
}