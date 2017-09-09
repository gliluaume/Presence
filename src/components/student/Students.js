import React from 'react'
import {List} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import PropTypes from 'prop-types'
import Student from './Student'

const Students = ({students}) => {
  return (
    <List>
      <Subheader>Students</Subheader>
      {
        students.map((student) => (
          <Student student={student} key={student.id} />
        ))
      }
    </List>
  )
}

Students.propTypes = {
  students: PropTypes.array.isRequired
}

export default Students
