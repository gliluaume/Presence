import React from 'react'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble'
import PropTypes from 'prop-types'

const Students = ({students}) => {
  return (
    <List>
      <Subheader>Students</Subheader>
      {
        students.map((student) => (
          <ListItem
            key={student.id}
            primaryText={`${student.firstname} ${student.lastname}`}
            rightIcon={<CommunicationChatBubble />}
            secondaryText={
              <p>
                lorem ipsum
              </p>
            }
            secondaryTextLines={1}
          />
        ))
      }
    </List>
  )
}

Students.propTypes = {
  students: PropTypes.array.isRequired
}

export default Students
