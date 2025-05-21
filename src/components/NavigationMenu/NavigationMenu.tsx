import style from './NavigationMenu.module.css'

import agendaImg from '../../assets/images/agenda.svg'
import calendarImg from '../../assets/images/calendar.svg'

interface Props {
  isOpen?: boolean,
}
export default function NavigationMenu({ isOpen }: Props) {
  return (
    <div className={style.navigationMenu + ' ' + (isOpen ? style.open : '')}>
      <ul>
        <li>
          <a href="#">
            <img src={agendaImg} alt="agenda Logo" />
            Show In Agenda</a>
        </li>
        <li>
          <a href="#">
            <img src={calendarImg} alt="Calendar Logo" />
            Show In Calendar</a>
        </li>
      </ul>
    </div>
  )
}
