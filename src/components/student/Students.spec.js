import { expect } from 'chai'
import enzymeToJSON from 'enzyme-to-json'
import jestExpect from 'jest-matchers'
import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import Subheader from 'material-ui/Subheader'

import Students from './Students'

describe('<Students />', () => {
  it('should render appropriately', () => {
    const students = [{
      id: 234,
      lastname: 'toto',
      firstname: 'tutu',
      birthdate: new Date()
    }]

    const wrapper = shallow(<Students students={students} />)
    expect(wrapper).to.contain(<Subheader>Students</Subheader>)
  })
})
