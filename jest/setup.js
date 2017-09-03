// Configuration centrale de Jest, test par test
// =============================================

// Enregistrement des plugins Chai génériques
// ------------------------------------------

const chai = require('chai')
// [Enzyme](http://airbnb.io/enzyme/) est la super techno d’Airbnb pour tester
// à toute bombe des composants React.  Elle dispose même d’un plugin Chai pour
// avoir des assertions plus "métier".
const createChaiEnzyme = require('chai-enzyme')
// On aime bien les diffs JSON de Jest, alors on les restaure pour les assertions
// Chai type `.deep.equal`…
const createChaiJestDiff = require('chai-jest-diff').default
// On s’assure également qu’on peut (et doit, en fait) utiliser toutes les assertions
// comme des fonctions, même `.undefined`, `.true`, etc. et celles ajoutées par les
// plugins (ex. `.calledOnce`). Ainsi, au lieu d’un échec silencieux en cas de faute
// de frappe, on a une erreur franche.
const dirtyChai = require('dirty-chai')
// On termine avec des assertions métier sur les *spies* et *stubs* Sinon, type
// `.calledOnce()` ou `.calledWith(…)`.
const sinonChai = require('sinon-chai')

chai
  .use(createChaiEnzyme())
  .use(createChaiJestDiff())
  .use(sinonChai)
  .use(dirtyChai)
