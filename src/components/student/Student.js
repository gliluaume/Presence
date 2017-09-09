import React from 'react'
import {ListItem} from 'material-ui/List'
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble'
import PropTypes from 'prop-types'

const Student = ({student}) => {
  return (
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
  )
}

Student.propTypes = {
  student: PropTypes.object.isRequired
}

export default Student
