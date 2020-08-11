import Twig         from 'twig'
import fake         from './functions/fake'
import globals      from './plugins/globals'
import implicitPath from './plugins/implicit-path'


// bust cache
Twig.extend(core => core.cache = false)

// support global data
Twig.extend(globals)

// support implicit path
Twig.extend(implicitPath)

// add faker functions
Twig.extendFunction('fake', fake)


/**
 * Expose enhanced Twig instance
 * @type {Twig}
 */
export default Twig