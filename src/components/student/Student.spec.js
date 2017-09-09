import { expect } from 'chai'
import enzymeToJSON from 'enzyme-to-json'
import jestExpect from 'jest-matchers'
import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import Subheader from 'material-ui/Subheader'

import Student from './Student'

describe('<Student />', () => {
  it('should render appropriately', () => {
    const student = {
      id: 234,
      lastname: 'toto',
      firstname: 'tutu',
      birthdate: new Date()
    }

    const wrapper = shallow(<Student student={student} />)
    expect(wrapper).to.have.prop('primaryText', 'tutu toto')
  })
})
