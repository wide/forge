import faker from 'faker'

const DEFAULT_PROP = {
  address: 'streetAddress',
  commerce: 'productName',
  company: 'companyName',
  database: 'columm',
  date: 'soon',
  finance: 'amount',
  hacker: 'noun',
  helper: 'randomize',
  image: 'image',
  internet: 'url',
  lorem: 'paragraph',
  name: 'findName',
  phone: 'phoneNumber',
  random: 'uuid',
  system: 'fileName'
}

export default (action = 'lorem', ...args) => {
  let [a, b] = action.split('.')
  return faker[a][b || DEFAULT_PROP[a]](...args)
}