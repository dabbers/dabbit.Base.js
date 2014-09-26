using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dabbit.Base
{
    public enum ControlCode
    {
        Bold = 0x02,     /**< Bold */
        Color = 0x03,     /**< Color */
        Italic = 0x09,     /**< Italic */
        StrikeThrough = 0x13,     /**< Strike-Through */
        Reset = 0x0f,     /**< Reset */
        Underline = 0x15,     /**< Underline */
        Underline2 = 0x1f,     /**< Underline */
        Reverse = 0x16      /**< Reverse */
    };

    public static class Utility
    {
        public static DateTime FromUnixTime(long unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime);
        }

        public static bool IsDigit(this char c)
        {
            return ((c >= '0') && (c <= '9'));
        }
    }
}
