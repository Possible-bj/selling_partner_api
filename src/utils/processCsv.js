import { URL, URLSearchParams } from 'url'

export const processCSV = async (csvItems) => {
  let ledger = []
  let totalMsrp = 0
  let totalPrice = 0
  // const totalLoadedItems = ledger?.length
  // const [dataLength, setDataLength] = useState(0)
  // const [loading, setLoading] = useState(false)
  // const [currentAsin, setCurentAsin] = useState('')
  // const [currentItems, setCurrentItems] = useState([])

  // calculate totl msrp

  const filterText = (text, regEx) => {
    const disallowed = text.match(regEx)
    if (disallowed?.length) {
      return true
    }
    return false
  }
  const getAsin = (element) => {
    const asin = element.find((e) => {
      if (e.length == 10 && e[0] == 'B') {
        const isInvalid = filterText(e, /[^a-zA-Z0-9]/g)
        if (!isInvalid) {
          // setCurentAsin(e)
          return e
        }
      } else if (e.length === 10 && e[0] !== 'B') {
        const isInvalid = filterText(e, /[^a-zA-Z0-9]/g)
        if (!isInvalid) {
          // setCurentAsin(e)
          return e
        }
      } else {
        return ''
      }
    })
    return asin
  }
  const getCategory = (element) => {
    const category = element.find((e) => {
      if (e.substring(0, 2) == 'gl') {
        return e
      }
    })
    return category
  }

  const getSubCategory = (element) => {
    const subCategory = element.map((e) => {
      const subString = e.substring(0, 4)
      const subString2 = e.substring(5, e.length - subString.length)
      if (
        Number.isInteger(Number(subString)) &&
        subString >= 4 &&
        isNaN(subString2) &&
        subString[3] == 0
      ) {
        return e
      }
    }).filter(Boolean)
    return subCategory
  }
  const getQuantity = (element) => {
    const quantity = element.find((e) => {
      if (e.length < 3) {
        return e
      }
    })
    return quantity
  }

  const getMSRP = (element) => {
    const msrp = element.find((e) => {
      if (Number(e))
        if (
          (isNaN(e) === false && !Number.isInteger(Number(e))) ||
          (isNaN(e) === false && Number(e) < 10000 && Number(e) > 1)
        ) {
          return e
        } else {
          return 0
        }
    })
    return Number(msrp)
  }
  const getUPC = (element) => {
    const upc = element.find((e) => {
      if (e.length > 9 && isNaN(e) === false) {
        return e
      } else {
        return ''
      }
    })
    return upc
  }

  const pushToLedger = (element, asin, price, asinStatus, requestStatus) => {
    if (element) {
      console.log({
        Description: element[3],
        Category: getCategory(element),
        subCategory: getSubCategory(element),
        MSRP: getMSRP(element),
        UPC: getUPC(element),
        ASIN: asin,
        Quantity: getQuantity(element),
        Price: price,
        counts: 1,
        asinStatus: asinStatus,
        requestStatus: requestStatus,
      })
      ledger.push(
        {
          Description: element[3],
          Category: getCategory(element),
          subCategory: getSubCategory(element),
          MSRP: getMSRP(element),
          UPC: getUPC(element),
          ASIN: asin,
          Quantity: getQuantity(element),
          Price: price,
          counts: 1,
          asinStatus: asinStatus,
          requestStatus: requestStatus,
        })
    }
  }
  // const processRows = async (items) => {
  let price = 0
  const params = {
    country: 'US',
    asin: '',
    topReviews: 'true',
  }

  var pattern = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
  let url = new URL(`https://amazon-products1.p.rapidapi.com/product`)

  for (let i = 1; i <= csvItems.length; i++) {
    const element = csvItems[i] && csvItems[i].split(pattern)
    const asin = element && getAsin(element)
    params.asin = asin
    url.search = new URLSearchParams(params).toString();
    if (asin && asin[0] === 'B') {
      try {
        const res = await fetch(url, {
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'amazon-products1.p.rapidapi.com',
            'x-rapidapi-key':
              '187853f3a0msh7c3059aa71bd743p1ca71djsn6006ede66135',
          }
        },
        )
        const data = await res.json()
        price = data?.prices?.current_price > 0 ? data?.prices?.current_price : 0
        pushToLedger(element, asin, price, 'valid', 'noError')
      } catch (e) {
        pushToLedger(element, asin, 0, 'valid', 'error')
      }
    } else {
      pushToLedger(element, asin, 0, 'invalid')
    }
  }
  ledger.forEach((x) => {
    totalMsrp += x.MSRP
    totalPrice += x.Price
  })

  return { ledger, totalMsrp, totalPrice }
  // setTimeout(() => {
  //   setLoading(false)
  // }, 2000)
  // }
} 