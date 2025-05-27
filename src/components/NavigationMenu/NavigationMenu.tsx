import style from './NavigationMenu.module.css'

import agendaImg from '../../assets/images/agenda.svg'
import calendarImg from '../../assets/images/calendar.svg'

interface Props {
  isOpen?: boolean,
  nodeId: string,
}
export default function NavigationMenu({ isOpen, nodeId }: Props) {
  return (
    <div className={style.navigationMenu + ' ' + (isOpen ? style.open : '')}>
      <ul>
        <li>
          <a href={`/campaign/agenda/${nodeId}`}>
            <img src={agendaImg} alt="agenda Logo" />
            Show In Agenda</a>
        </li>
        <li>
          <a href={`/campaign/calendar/${nodeId}`}>
            <img src={calendarImg} alt="Calendar Logo" />
            Show In Calendar</a>
        </li>
      </ul>
    </div>
  )
}
